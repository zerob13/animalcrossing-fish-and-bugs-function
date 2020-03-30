# animalcrossing-fish-and-bugs-function

openfaas api for query animalcrossing fish and bugs

## Usage

* Get OpenFaas and Docker Swarm [Read Here](https://docs.openfaas.com/deployment/docker-swarm/)
* Set up Mongodb
  
```
$ docker service create --network=func_functions --name openfaas-animal-mongod --publish 27017:27017 mongo mongod
```

* Clone this repo

```
$ git clone https://github.com/zerob13/animalcrossing-fish-and-bugs-function.git

cd animalcrossing-fish-and-bugs-function
```

* Pull template

```
$ faas template pull https://github.com/zerob13/openfaas-node-koa-template.git                             
```

* build and deploy

```
$ faas build
$ faas deploy
```