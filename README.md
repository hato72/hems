# hems

## リポジトリのforkとは
forkすると自分のgithubにコピーリポジトリを作ることができるため、プッシュしても元のリポジトリには反映されない　反映させるときはプルリクエストを送る必要がある

リポジトリをforkしたらforkしたリポジトリ(それぞれのgithubに作られる)をクローンする

## リポジトリのクローンとは
元のリポジトリに対して作業を行うことになるので、プッシュするとそのまま元のリポジトリに反映される　

こちらの方法でやる場合は新しくブランチを切って新しいブランチに対してプッシュを行い、動作確認ができたらそのブランチをmainブランチにマージする

git clone https://github.com/hato72/hems.git


## python仮想環境　作り方
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

## バックエンド実行方法
仮想環境を立てた後
```sh
pip install -r server/requirements.txt
python server/app.py
```
## フロントエンド実行方法
```sh
npm install
npm run dev
```
