import React from 'react';
import BottomBar from './BottomBar';
import Header from './Header';

function Groceries() {
  const groceryList = [
    { id: 1, item: 'Milk', category: 'Dairy' },
    { id: 2, item: 'Bread', category: 'Bakery' },
    { id: 3, item: 'Eggs', category: 'Dairy' },
    { id: 4, item: 'Chicken', category: 'Meat' },
  ];

  return (
    <div className="pb-20">
      <Header />
      <div className="p-4">
        <div className="space-y-4">
          {groceryList.map(item => (
            <div key={item.id} className="flex items-center bg-white p-3 rounded-lg shadow">
              <input type="checkbox" className="mr-3" />
              <div>
                <p className="font-medium">{item.item}</p>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomBar />
    </div>
  );
}

export default Groceries; 