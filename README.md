# Event Tracking Tool

so basically this thing scrapes events from district.in website and saves them to google sheets. pretty cool right?

## what does it do?

- scrapes events from district.in for different cities (delhi, mumbai, jaipur, kolkata, pune)
- saves all the event data to google sheets automatically
- runs in background every 4 hours and scrapes all cities
- marks old events as expired so you know whats still happening
- simple menu to pick which city you wanna scrape

## how it works

1. you run the app
2. it shows you a menu with cities
3. you pick a city
4. it opens a browser (playwright) and goes to district.in
5. selects your city from dropdown
6. grabs all the events (name, date, venue, price etc)
7. saves everything to your google sheet
8. also theres a background job that runs every 4 hours and does this for all cities automatically

## 3rd party stuff we using

| thing | what it does |
|-------|--------------|
| playwright | opens browser and scrapes the website |
| google-spreadsheet | talks to google sheets api |
| google-auth-library | authentication for google |
| inquirer | makes the nice menu in terminal |
| node-cron | runs the background job every 4 hours |
| dayjs | date stuff |
| dotenv | loads env variables |

## installation

ok so first you need nodejs installed. if you dont have it go download it lol

```bash
# clone the repo or whatever
git clone <your-repo-url>
cd event-tracking-tool

# install all the packages
npm install

# install playwright browsers (important!!)
npx playwright install
```

## setup google sheets

this part is kinda annoying but you gotta do it once

1. go to google cloud console (https://console.cloud.google.com)
2. make a new project
3. enable these apis:
   - Google Sheets API
   - Google Drive API
4. go to credentials and create a service account
5. download the json key file
6. put that json file in your project folder
7. create a new google sheet
8. share that sheet with your service account email (the one that looks like something@project.iam.gserviceaccount.com)
9. copy the sheet id from the url (its the long random string)

## env file

make a `.env` file and put this stuff:

```
SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"
```

you can find the email and private key in that json file you downloaded

## running it

```bash
# start the app
npm start

# or
node app.js
```

then just pick a city and watch it do its thing

## folder structure

```
event-tracking-tool/
├── app.js              # main file, starts everything
├── cli/
│   └── prompt.js       # the menu stuff
├── config/
│   ├── constants.js    # cities list and other constants
│   └── spreadsheet.config.js  # google sheets connection
├── scrapper/
│   └── scraper.js      # the actual scraping code
├── service/
│   └── eventService.js # scraping logic
├── sheets/
│   └── sheets.js       # google sheets operations
└── utils/
    └── helpers.js      # random helper functions
```

## notes

- the scraper opens a real browser window so you can see whats happening
- dont run it too fast or district.in might block you idk
- the background job runs every 4 hours automatically when app is running
- expired events get marked but not deleted

## if something breaks

- make sure your env variables are correct
- check if google sheets api is enabled
- make sure you shared the sheet with service account
- try running `npx playwright install` again

thats pretty much it. have fun!