BATTLESHIPS!
============

1. Introduction and Background
2. Versions
3. User Guide
4. Testing
5. Related Resources

1. Introduction and Background:
-------------------------------
Hello and thank you for coming to take a look at my frontend only version of Battleships!

This web application was designed and developed as part of General Assembly's (GA) Web Development Immersive (WDI) course as Project 0. More information about GA's WDI course can be found by visiting this [link](https://generalassemb.ly/education/web-development-immersive).

The requirements for this project were to make a multiplayer game in the browser using concepts we had learned in HTML, CSS and JavaScript over the first part of the course. The suggested project for the class was to create a Tic-Tac-Toe project which can be found in my other repo here:

[Scoutski's Tic Tac Toe repository](https://github.com/Scoutski/tictactoegame)

When starting this project I wanted to expose myself to additional technologies and challenge myself with a difficult concept that would require me to use all time available over the course of the project week (about 4 days). The ways I decided to do this were:

- Make use of Firebase, a faux backend for transferring data in realtime between players.
- Create the game battleships which would simultaneously allow players to see their own board with their opponents moves and see the board they are attacking.
- Implement a chat features so players could talk during the course of the game and that previous messages would be stored in the database.

I went over the development of this project on my personal WDI blog which can be found at:

[Michael Cooper's WDI Blog - Day 12](https://mijcooperwdi.wordpress.com/2015/05/13/wdi-day-12-boats-boats-boats/)

2. Versions:
------------

v1.0: The first working version of this project was released on Thursday, 14 May 2015. It involved all the functionality outlined above and had a very basic user interface.

Future Versions:
Although I am undecided on whether I will continue this project, additional functionality may include:
- Spectator functions for all players joining after the game has started.
- A restart function to allow two players to start a new game after it has ended.
- Additional design elements.

3. User Guide:
--------------

In order to play this game of battleships, you and your opponent must both visit the index.html file linked with the projects. To use my personal gitpages page, please use this link:

[Link to Scoutski's git-pages Battleships! game](http://scoutski.github.io/mystery/)

Note that this game currently only supports 2 players and can not have additional sessions. This unfortunately is one of the limitations of the game and I have no plans to adjust this.

### Phase 1:

Once the page has loaded for both players, begin by placing ships on the white 8x8 board (the player's board) in the right hand section of the page. The vertical checkbox at the bottom of the page can be used to place a ship vertically otherwise it will appear horizontal by default. The cell that is clicked will be the topmost/leftmost corner of the ship.

Ships are placed in order of size with one of each type placed on the board, the types of ships are:

- Aircraft carrier with a length of 5
- Battleship with a length of 4
- Destroyer	with a length of 3
- Patrol boat with a length of 2

Once all ships are placed, the game will automatically begin checking that your opponent has placed all of their ships. Once the server has detected that both players are ready, the game will start!

### Phase 2:

The first player to join the game is considered 'Player 0' and will have the opportunity to fire first. By using the swap board button at the bottom of the game board they will see a different coloured version of the game board and can select a cell to attempt to hit an enemy battleship. The status console will log whether a hit or miss was achieved based on the shot.

The game will alternate between players who can check both boards to see their opponents turn history and their own turn history. When the local player sinks an enemy ship, they will be notified in the console and a sound will be played.

Once one player has sunk all their opponents ships, they will be notified via the console and the game will be considered over.

Testing:
--------

There are a few known issues with this game that may be addressed in a future version. At times there are connection issues with the Firebase database which can render the game unplayable, these have been minimized through the use of timeout functions that allow the server more time to get ready.

As the project was only created within four days, testing has not been completed thoroughly enough to suggest that everything is working completely as intended. That said, I tried very hard to test a lot of different scenarios and tried to break the game logic and fixed all known issues.

Related Resources:
------------------

Please see any of the following links for more information about the components of this project and some of the related resources that were used and referenced in the creation of this project:

- [Firebase official website w/ API](https://www.firebase.com/)
- [Wikipedia's entry on the Battleship board game](http://en.wikipedia.org/wiki/Battleship_(game))
- [Handling Synchronized Arrays with Real-Time Firebase Data (article)](https://www.firebase.com/blog/2014-05-06-synchronized-arrays.html)
