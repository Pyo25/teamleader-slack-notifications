# Slack Notifications for Teamleader

This small tool checks if some stuffs have changed in Teamleader and notifies the changes to a Slack channel.

**Important**: I made this tool for my personal use. It might not fit your needs but feel free to open a PR for any improvement ;-)

## How it works

At the time of writing Teamleader doesn't support webhooks to receive events. The only way to know if something has changed is to periodically fetch the desired data and check if it has changed since the last check. That's how this tool works.

## Currently-supported notifications

At the moment, there is only 1 watcher implemented for Deal Phase Changes (cfr `watchers/deal_phase_watcher.js`).
This watcher pushes a notification when a deal is moved from one phase to another.

## How to use

Make sure you have Node.js v4 or higher and npm.

1. Clone the repo
2. Install dependencies: `npm i`
3. Set up a [Slack incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)
3. Edit the `config.json` file with your API key, group, webhook URL and Slack channel
4. Run the tool `npm start`

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License
This code is released under the MIT License.

## Credits
Made with ️❤️️️ by [Javry](https://javry.com) in Belgium.

