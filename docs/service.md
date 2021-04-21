# TimeStamp service

1. Create or start docker container
2. Create table that houses timestamps
3. Send the insert queries.

This is a simple cache-less, write-heavy service.

## Post

```shell

curl -d "app=curl&what=second" -X POST http://localhost:54083/ts
#{"success":true,"requestid":"693953cd3175648445c0232d761946d5dee8801343422833d529aaa8e4c5df45"}

```

Note: curl might have issues with local CA. It works in firefox just fine.

## GET

```shell

curl -s http://localhost:54083/ts | python -mjson.tool                                                                         f0c1s@debian
{
    "success": true,
    "timestamps": [
        {
            "id": "3",
            "app": "rest-client",
            "what": "third",
            "ts": "2021-04-21T03:21:11.378Z",
            "requestid": "b53af42f0a5d677f8b6384a8cdd91be69397c74cf69ccdc0f989a2c325256a09"
        },
        {
            "id": "2",
            "app": "curl",
            "what": "second",
            "ts": "2021-04-21T03:15:33.454Z",
            "requestid": "693953cd3175648445c0232d761946d5dee8801343422833d529aaa8e4c5df45"
        },
        {
            "id": "1",
            "app": "rest-client",
            "what": "first",
            "ts": "2021-04-21T03:12:47.862Z",
            "requestid": "02950952036b16fb7064c234c7935a62d49ebf64bf70250cd5a7dab23cb4de09"
        }
    ]
}


```
