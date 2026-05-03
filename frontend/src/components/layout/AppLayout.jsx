import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from '../player/Player';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-player">
        <Player />
      </footer>
    </div>
  );
}
