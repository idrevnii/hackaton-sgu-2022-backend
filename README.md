Бек-енд для сайта с экспортом расписания СГУ в json/ics, также имеет АПИ для новостей

# Запуск

1. Установить зависимости `yarn` или `npm install`
2. Запустить сервер `yarn develop` или `npm run develop`

Теперь веб-сервер доступен по адресу `http://localhost:3001`.
Доступны такие пути:

1. `/news` - отдает json с последними новостями
2. `/schedule?url=` - отдает json с расписанием, необходимо после url= указать ссылку на расписание
3. `/calendar?url=` - отдает ics с календарем, необходимо после url= указать ссылку на расписание
