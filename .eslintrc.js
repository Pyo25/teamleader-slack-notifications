module.exports = {
  "extends": "airbnb-base",
  "env": {
    "es6": true,
    "node": true
  },
  "rules": {
    "no-use-before-define": 0,
    "no-console": 0,
    "class-methods-use-this": 0,
    "no-param-reassign": 0,
    "max-len": {
      "code": 100
    }
  },
  "plugins": [
    "import"
  ],
};