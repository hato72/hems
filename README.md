# hems

## 仮想環境　作り方
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