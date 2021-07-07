#!/usr/bin/env sh

kubectl port-forward -n mojaloop --address 0.0.0.0 deploy/mojaloop-centralledger-service 4001:3001 &
kubectl port-forward -n mojaloop --address=0.0.0.0 deploy/mojaloop-centralsettlement-service 3007 &
kubectl port-forward -n mojaloop --address=0.0.0.0 sts/mojaloop-centralledger-mysql 3306 &

clean_up() {
    pkill -s $$
}

trap clean_up SIGHUP SIGINT SIGTERM

sleep infinity
