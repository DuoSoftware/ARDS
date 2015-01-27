package main

import (
	"code.google.com/p/gorest"
	"fmt"
)

type SelectionAlgo struct {
	gorest.RestService `root:"/SelectionAlgo/" consumes:"application/json" produces:"application/json"`
	basicSelection     gorest.EndPoint `method:"GET" path:"/Select/BasicSelection/{Company:int}/{Tenant:int}/{SessionId:string}" output:"[]string"`
}

func (selectionAlgo SelectionAlgo) BasicSelection(Company, Tenant int, SessionId string) []string {

	const longForm = "Jan 2, 2006 at 3:04pm (MST)"

	fmt.Println(Company)
	fmt.Println(Tenant)
	fmt.Println(SessionId)

	ch := make(chan []string)

	go BasicSelection(Company, Tenant, SessionId, ch)
	var result = <-ch
	close(ch)
	return result

}
