// SelectionAlgo project main.go
package main

import (
	"code.google.com/p/gorest"
	"fmt"
	"net/http"
)

type Configuration struct {
	RedisIp string
	RedisDb int
}

type AttributeData struct {
	AttributeCode     []string
	AttributeClass    string
	AttributeType     string
	AttributeCategory string
	WeightPrecentage  string
}

type Request struct {
	Company       int
	Tenant        int
	Class         string
	Type          string
	Category      string
	SessionId     string
	AttributeInfo []AttributeData
}

func main() {
	fmt.Println("Initializting Main")
	InitiateRedis()
	gorest.RegisterService(new(SelectionAlgo))
	http.Handle("/", gorest.Handle())
	http.ListenAndServe(":2228", nil)
}
