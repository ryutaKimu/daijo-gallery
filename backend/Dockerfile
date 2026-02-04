FROM golang:1.25.2-bookworm

# 作業ディレクトリ
WORKDIR /app

# Air と Goose をインストール
RUN go install github.com/air-verse/air@latest \
    && go install github.com/pressly/goose/v3/cmd/goose@latest

# Go モジュールのコピーと tidy
COPY go.mod go.sum ./

# API のソースを /app 配下にコピー
COPY . .

# tmp ディレクトリ作成
RUN mkdir -p tmp

# デバッグ用: コピー内容確認
RUN ls -R /app

# Air 実行
CMD ["air"]
