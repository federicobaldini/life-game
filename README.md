# life-game

A web application that play the John Conway's Game of Life, using TypeScript, Rust and WebAssembly.

<p align="center">
  <img src="https://github.com/federicobaldini/life-game/blob/main/application.png" alt="application" />
</p>

## Requirements

wasm-pack build --target web

To successful run this code, you need to have Rust and Cargo installed on your Machine.

For the instalation guide [click here](https://www.rust-lang.org/learn/get-started).

## Getting started 

Just clone the repo and use cargo to run the code as shown below

```bash
    $ git clone https://github.com/federicobaldini/life-game
    $ cd life-game
    life-game->$ wasm-pack build --target web
```

Then to start the web application 

```bash
    life-game->$ cd server
```

Install the dependencies:

```
npm install
```

then start the development server:

```
npm run dev
```

Navigate to [localhost:3000](http://localhost:3000). You should see the app running.
