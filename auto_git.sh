#!/bin/bash

ENVIRONMENT="github-pages"
REPO="Au12jp/mp3"

# エラーが発生した場合にリモートブランチにリセットする関数
rollback_changes() {
    echo "An error occurred during the pull. Resetting to origin/main..."
    git fetch origin main
    git reset --hard origin/main  # 変更を捨ててリモートブランチにリセット
    exit 1
}

# ビルドプロセスを実行
echo "Running build process..."
npm run build  # または `yarn build` を使用している場合は `yarn build`

# ビルドに失敗した場合、スクリプトを終了
if [ $? -ne 0 ]; then
    echo "Build failed. Aborting commit and push."
    exit 1
fi

# 未ステージの変更がある場合、それを一時的にstashする
if ! git diff-index --quiet HEAD --; then
    echo "Stashing uncommitted changes..."
    git stash push -m "auto-stash"
fi

# 最新の変更をプル
echo "Pulling latest changes from origin..."
git fetch origin main || rollback_changes
git rebase origin/main || rollback_changes  # エラー時にロールバック

# スタッシュした変更がある場合、それを再適用
if git stash list | grep -q "auto-stash"; then
    echo "Applying stashed changes..."
    git stash pop
fi

# コミットとプッシュ
commit_count=$(git rev-list --count HEAD)
commit_message="Auto commit #$commit_count"

git add .
git commit -m "$commit_message"  # コミットが失敗してもロールバックしない
git push origin main  # プッシュが失敗してもロールバックしない

# GitHub Pagesへのデプロイ
echo "Deploying to GitHub Pages..."
git push origin main:gh-pages  # デプロイが失敗してもロールバックしない

# 古いデプロイメントを削除する前に、アクティブなデプロイメントを無効化
echo "Cleaning up old deployments..."
for ID in $(gh api -X GET /repos/${REPO}/deployments?environment=${ENVIRONMENT// /%20} | jq -r ".[] | .id")
do
  echo "Setting deployment ID $ID to inactive"
  gh api -X PATCH /repos/${REPO}/deployments/$ID -f state=inactive

  echo "Deleting deployment ID: $ID"
  gh api -X DELETE /repos/${REPO}/deployments/$ID
done

# Gitのクリーンアップ
echo "Cleaning up git..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Deployment completed and old deployments cleaned up."