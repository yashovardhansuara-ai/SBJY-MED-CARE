/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dashboard from './components/Dashboard';
import { SettingsProvider } from './contexts/SettingsContext';
import { SecureChatProvider } from './contexts/SecureChatContext';

export default function App() {
  return (
    <SettingsProvider>
      <SecureChatProvider>
        <Dashboard />
      </SecureChatProvider>
    </SettingsProvider>
  );
}
