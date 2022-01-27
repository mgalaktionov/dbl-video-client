# Double kurento pipeline app
## Run Kurento media server
```shell
 docker-compose up 
```
# загружает gradle wrapper
```shell
 ./gradlew wrapper
```
# сборка проекта, прогон unit-тестов, запуск приложения
```shell
./gradlew clean build bootRun
```

После успешного запуска приложение доступно по адресу `localhost:8443`