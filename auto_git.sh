#!/bin/bash

# ビルドプロセスを実行
echo "Running build process..."
npm run build  # または `yarn build` を使用している場合は `yarn build`

# ビルドに失敗した場合、スクリプトを終了
if [ $? -ne 0 ]; then
    echo "Build failed. Aborting commit and push."
    exit 1
fi

# 現在のコミット数を取得して、それに基づいたコミットメッセージを生成
commit_count=$(git rev-list --count HEAD)
commit_message="Auto commit #$commit_count"

# Gitの状態を確認し、変更があれば自動でコミット＆プッシュ
git add .
git commit -m "$commit_message"
git push origin main

# GitHub Actionsでのデプロイを待つ
echo "Deployment process will be handled by GitHub Actions..."

# ローカルの不要なGitオブジェクトをクリーンアップ
echo "Cleaning up old deployments..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Deployment completed and old deployments cleaned up."
