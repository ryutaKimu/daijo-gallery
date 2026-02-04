package router

import (
	"net/http"

	"github.com/ryutaKimu/daijo-gallery-api/internal/handler"
)

func New() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handler.Home)

	return mux
}
