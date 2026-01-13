# FF Dashboard

FF Dashboard is a lightweight fantasy football analytics dashboard built with Svelte. It provides an interactive interface for exploring players and rosters in your fantasy football league and quickly visualize trends. 

[Demo](https://dreaesposito.github.io/ff-dashboard/)

![Screenshot](/assets/screenshot.png)

**Features**
- A main dashboard layout to analyze the players that make up each roster in your fantasy football league
    - A dropdown to select which league you want to view, a resizeable layout with player rankings (left) and the roster lists (right)
    - Visual indicators highlighting upward and downward value trends, relative team values (compared to other teams) broken up by postion type, and roster player rankings in the sidebar
- Player projections page that collects data from a few different sources (PPR is only supported for now) to provide weekly rankings
- A WIP weekly matchups page that display all the matchups that took place in your league and their outcomes

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building the project

If you want to create a production version of the app:

```sh
npm run build
```