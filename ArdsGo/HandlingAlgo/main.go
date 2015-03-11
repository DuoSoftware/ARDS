// HandlingAlgo project main.go
package main

import (
	"code.google.com/p/gorest"
	"fmt"
	"net/http"
)

type Configuration struct {
	RedisIp          string
	RedisDb          int
	ResourceCSlotUrl string
}

type AttributeData struct {
	Attribute  string
	Class      string
	Type       string
	Category   string
	Precentage float64
}

type Resource struct {
	Company               int
	Tenant                int
	Class                 string
	Type                  string
	Category              string
	ResourceId            string
	ResourceAttributeInfo []AttributeData
	OtherInfo             string
}

type CSlotInfo struct {
	Company         int
	Tenant          int
	Class           string
	Type            string
	Category        string
	State           string
	HandlingRequest string
	ResourceId      string
	SlotId          int
	ObjKey          string
	SessionId       string
}

func main() {
	fmt.Println("Initializting Main")
	InitiateRedis()
	gorest.RegisterService(new(HandlingAlgo))
	http.Handle("/", gorest.Handle())
	http.ListenAndServe(":2223", nil)
}
