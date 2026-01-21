import React from 'react';
import { Card, Button } from "@/components";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button variant="primary">New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Users">
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-500">+12% from last month</p>
        </Card>
        <Card title="Active Courses">
          <p className="text-3xl font-bold text-green-600">42</p>
          <p className="text-sm text-gray-500">8 new this week</p>
        </Card>
        <Card title="Pending Review">
          <p className="text-3xl font-bold text-orange-600">7</p>
          <p className="text-sm text-gray-500">Requires attention</p>
        </Card>
      </div>

      <Card title="Recent Activity">
        <ul className="space-y-4">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  U{i}
                </div>
                <div>
                  <p className="font-medium text-gray-900">User updated profile</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">View</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}