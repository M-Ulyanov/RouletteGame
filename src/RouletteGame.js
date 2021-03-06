// RouletteGame 0.1
// Author: M.Ulyanov
// Created: 23/10/2016
// Github: https://github.com/M-Ulyanov/RouletteGame
// Example: http://m-ulyanov.github.io/roulettegame/


var RouletteGame = (function ($) {

  'use strict';

  /**
   * RouletteGame
   * @param options
   * @constructor
   */
  function RouletteGame(options) {


    // Default options
    var defaultOptions = {
      cell: 120,
      stopCell: 20,
      visibleCell: 5,
      duration: 13,
      easing: 'swing',
      wrapperClass: '',
      insert: null,
      callback: null
    };

    if (options) {
      this.options = $.extend(true, defaultOptions, options);
    }

    // Private Fields
    this._storage = [];
    this._bank = 0;
    this._index = 0;
    this._winner = null;

  }


  /**
   * Calc chance current game
   * @private
   */
  RouletteGame.prototype._calc = function () {

    var currentRandomChance, currentItemChance;
    var arrayResult = [];
    var cloneStorage = calcChance($.extend(true, [], this._storage));
    var lastChance = cloneStorage[cloneStorage.length - 1].chance;
    var winnerIndex = this.options.cell - this.options.stopCell + Math.floor(this.options.visibleCell / 2);

    for (var i = 0; i < this.options.cell; i++) {
      currentRandomChance = randomInteger(0, lastChance);
      for (var j = 0; j < cloneStorage.length; j++) {
        currentItemChance = cloneStorage[j].chance;
        if (currentItemChance >= currentRandomChance) {
          if (winnerIndex === i) {
            this._winner = cloneStorage[j];
          }
          arrayResult.push(cloneStorage[j].html);
          break;
        }
      }
    }

    this._renderHTML(arrayResult, winnerIndex);


    /**
     * calc chance for storage item
     * @param storage
     * @returns {*}
     */
    function calcChance(storage) {
      var totalSum = 0;
      storage.forEach(function (item) {
        var result = totalSum + parseFloat(item.procent).toFixed(2) * 100;
        totalSum += result;
        item.chance = parseInt(result);
      });

      return storage;
    }


    /**
     * Get random integer
     * @param min
     * @param max
     * @returns {number}
     */
    function randomInteger(min, max) {
      var randomNumber = min - 0.5 + Math.random() * (max - min + 1);
      randomNumber = Math.round(randomNumber);
      return randomNumber;
    }

  };


  /**
   * Create DOM elements for RouletteGame
   * @param arrayResult
   * @param winnerIndex
   * @private
   */
  RouletteGame.prototype._renderHTML = function (arrayResult, winnerIndex) {

    var $wrapper = $('<div class="roulette-wrapper ' + this.options.wrapperClass + '"></div>');
    var $field = $('<div class="roulette-field">');
    this._$list = $('<ul class="roulette-list">');

    if (arrayResult.length > 0) {
      arrayResult.forEach(function (element, index) {
        var winnerClass = '';
        if (winnerIndex === index) {
          winnerClass = 'roulette-winner';
        }
        this._$list.append($('<li class="roulette-item ' + winnerClass + '">' + element + '</li>'));
      }, this);
    }
    $wrapper.append($('<div class="roulette-arrow"></div>'));

    $field.append(this._$list);
    this.options.insert.append($wrapper.append($field));

    var $li = this._$list.find('li');
    var liOuterWidth = $li.outerWidth(true);

    this._gameOffset = liOuterWidth * $li.length - liOuterWidth * this.options.stopCell;

  };


  RouletteGame.prototype._arrowAnimate = function () {

    var self = this;

    function arrowAnimateScale() {
      var second = 0;
      var coeff = 0.85;
      setTimeout(function go() {
        $('.roulette-arrow').css({
          '-webkit-transform': 'scale(' + coeff + ')',
          '-ms-transform': 'scale(' + coeff + ')',
          'transform': 'scale(' + coeff + ')'
        });
        coeff = 1 > coeff ? 1 : 0.85;
        if (second < (self.options.duration * 2 - 1)) {
          setTimeout(go, 500);
        }
        second++;
      }, 0);
    }

    arrowAnimateScale();

  };

  /**
   * callBack after end current game
   * @private
   */
  RouletteGame.prototype._callBack = function () {

    if (getNameConstructor(this.options.callback) === 'Function') {
      this.options.callback(this._winner);
      this._$list.addClass('roulette-end');
    }

  };


  /**
   * Push data in storage
   * @param data
   * @returns {*}
   */
  RouletteGame.prototype.push = function (data) {

    var type = getNameConstructor(data);
    if (type === 'Array') {
      data.forEach(function (current) {
        if (current.procent != null) {
          current.index = this._index++;
          this._storage.push(current);
          pushToBank.apply(this, [parseFloat(current.bet)]);
        }
      }, this);
    }
    else if (type === 'Object' && data.procent != null) {
      data.index = this._index++;
      this._storage.push(data);
      pushToBank.call(this, parseFloat(data.bet));
    }
    else {
      console.error('Expected: type Array or Object, instead got: ' + type);
      return false;
    }


    /**
     * Push to bank
     * @param bet
     */
    function pushToBank(bet) {
      if (!isNaN(bet)) {
        this._bank += bet;
      }
    }

    return this;

  };


  /**
   * Calc and render HTML current game
   * @returns {RouletteGame}
   */
  RouletteGame.prototype.render = function () {

    this._calc();
    return this;

  };


  /**
   * Start current game
   * @returns {RouletteGame}
   */
  RouletteGame.prototype.start = function () {

    var self = this;
    this._$list.css('position', 'relative').animate({
      left: -self._gameOffset
    }, self.options.duration * 1000, self.options.easing, function () {
      self._callBack();
    });

    this._arrowAnimate();

    return this;

  };


  /**
   * Clear storage current game
   */
  RouletteGame.prototype.clearStorage = function () {

    this._storage = [];
    return this;

  };


  /**
   * Clear bank current game
   */
  RouletteGame.prototype.clearBank = function () {

    this._bank = 0;
    return this;

  };


  /**
   * Remove item from storage
   * @param index
   * @returns {RouletteGame}
   */
  RouletteGame.prototype.remove = function (index) {

    if (index >= 0) {
      this._storage.splice(index, 1);
    }
    return this;

  };


  /**
   * Get bank current game
   * @returns {number}
   */
  RouletteGame.prototype.getBank = function () {

    return this._bank;

  };


  /**
   * Get storage current game
   * @returns {Array}
   */
  RouletteGame.prototype.getStorage = function () {

    return this._storage;

  };


  /**
   * Get winner last game
   * @returns {null|*}
   */
  RouletteGame.prototype.getWinner = function () {

    return this._winner;

  };


  /**
   * Get name Constructor
   * @param object
   * @returns {string}
   */
  function getNameConstructor(object) {

    return Object.prototype.toString.call(object).slice(8, -1);
  }


  return RouletteGame;

})(jQuery);