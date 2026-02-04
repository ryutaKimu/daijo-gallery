package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ryutaKimu/daijo-gallery-api/internal/router"
)

func main() {
	r := router.New()

	srv := &http.Server{
		Addr:    ":9090",
		Handler: r,
	}

	go func() {
		log.Println("start server :9090")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// SIGTERM / Ctrl+C 待ち
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	log.Println("shutdown start...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("shutdown error:", err)
	}

	log.Println("shutdown complete")
}
