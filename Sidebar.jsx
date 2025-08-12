import React from 'react';

const Sidebar = ({ activeTab, onNavigate, isSupervisor }) => {
  // Define menu items based on user role
  const getMenuItems = () => {
    const items = [
      { id: 'dashboard', icon: '📝', text: 'Sales Reports' },
      { id: 'stats', icon: '📊', text: 'Dashboard' },
      { id: 'installment', icon: '💳', text: 'Installment Lookup' }
    ];
    
    // Add user management for supervisors
    if (isSupervisor) {
      items.push({ id: 'users', icon: '👥', text: 'User Management' });
    }
    
    items.push(
      { id: 'customers', icon: '🧑‍💼', text: 'Customers' },
      { id: 'payments', icon: '💰', text: 'Payments' },
      { id: 'settings', icon: '⚙️', text: 'Settings' }
    );
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white shadow-sm hidden md:block">
      <div className="h-full px-3 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`flex items-center p-3 text-base font-normal rounded-lg hover:bg-gray-100 w-full text-left ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="w-6 h-6 text-center">{item.icon}</span>
                <span className="ml-3">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;