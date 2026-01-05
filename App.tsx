
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ModuleView } from './components/ModuleView';
import { StatementView } from './components/StatementView';
import { CompanyDashboard } from './components/CompanyDashboard';
import { ChatInterface } from './components/ChatInterface';

const Home = () => {
  return <CompanyDashboard />;
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/statement" element={<StatementView />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/module/:moduleId/:tabId" element={<ModuleView />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
