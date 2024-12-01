# hems

## デモ動画
https://drive.google.com/file/d/1soLL6KKTv8nc0W3l6fdCyCmh0JkbqBHo/view?usp=drive_link

<!-- ## リポジトリのforkとは
forkすると自分のgithubにコピーリポジトリを作ることができるため、プッシュしても元のリポジトリには反映されない　反映させるときはプルリクエストを送る必要がある

リポジトリをforkしたらforkしたリポジトリ(それぞれのgithubに作られる)をクローンする

## リポジトリのクローンとは
元のリポジトリに対して作業を行うことになるので、プッシュするとそのまま元のリポジトリに反映される　

こちらの方法でやる場合は新しくブランチを切って新しいブランチに対してプッシュを行い、動作確認ができたらそのブランチをmainブランチにマージする -->
## クローンのやり方
このリポジトリをクローンする時
```
git clone https://github.com/hato72/hems.git
```

## python仮想環境作り方
```
python -m venv 仮想環境名
```

windows
```sh
.\仮想環境名\Scripts\activate
```

Mac
```sh
source 仮想環境名/bin/activate

もしくは

. 仮想環境名/bin/activate
```

## フロントエンド実行方法
```sh
npm install
npm run dev
```

## バックエンド実行方法
仮想環境を立てた後
```sh
pip install -r server/requirements.txt
```
```
python server/app.py
```

# Git 操作方法
## git pull
リモートリポジトリの変更をローカル(自分が操作している方)に反映する

## ブランチ作成方法
```
git checkout -b ブランチ名
```

## コミット
```
git add --all
```
で変更をステージングした後以下を実行(ファイルを1つずつステージングしたい場合はgit add ファイル名)
```
git commit -m "ここにメッセージを入れる"
```
## コミットをプッシュ
ローカルリポジトリのコミット履歴をリモートリポジトリに送信して更新
```
git push リポジトリ名 ローカルブランチ名:リモートブランチ名
```

## 直前のコミットを取り消したい場合
```
git reset --soft HEAD^
```
