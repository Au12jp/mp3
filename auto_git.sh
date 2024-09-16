#!/bin/bash

# 環境変数の設定
REPO="Au12jp/mp3"  # リポジトリの名前
ENVIRONMENT="github-pages"  # GitHub Pages用の環境名

# ビルドプロセスを実行
echo "Running build process..."
npm run build  # または `yarn build` を使用している場合は `yarn build`

# ビルドに失敗した場合、スクリプトを終了
if [ $? -ne 0 ]; then
    echo "Build failed. Aborting commit and push."
    exit 1
fi

# ステージされていない変更を確認
if ! git diff --quiet; then
    echo "There are unstaged changes. Staging and committing them..."

    # 現在のコミット数を取得して、それに基づいたコミットメッセージを生成
    commit_count=$(git rev-list --count HEAD)
    commit_message="Auto commit #$commit_count"

    # 変更をステージングエリアに追加
    git add .

    # 変更をコミット
    git commit -m "$commit_message"
fi

# リモートの変更をプルしてリベース
echo "Pulling latest changes from origin..."
git pull --rebase

# コンフリクトが発生した場合
if [ $? -ne 0 ]; then
    echo "There was a conflict during rebase. Please resolve conflicts and continue."
    git reset --hard origin/main
    exit 1
fi

# リベースが完了したらプッシュ
echo "Pushing to main..."
git push origin main

# GitHub Pagesへのデプロイ
echo "Deploying to GitHub Pages..."
# gh-pagesブランチの最新デプロイだけを保持するために、リモートのgh-pagesブランチを上書き
git push --force origin main:gh-pages

# 古いデプロイメントを削除する前に、アクティブなデプロイメントを無効化
echo "Cleaning up old deployments..."
for ID in $(gh api -X GET /repos/${REPO}/deployments?environment=${ENVIRONMENT// /%20} | jq -r ".[] | .id")
do
  echo "Setting deployment ID $ID to inactive"
  gh api -X PATCH /repos/${REPO}/deployments/$ID -f state=inactive

  echo "Deleting deployment ID: $ID"
  gh api -X DELETE /repos/${REPO}/deployments/$ID
done

# リモートの不要なブランチや履歴をクリーンアップ
git push origin --prune

echo "Deployment completed and old deployments cleaned up."