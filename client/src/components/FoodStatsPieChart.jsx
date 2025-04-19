// components/FoodStatsPieChart.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

const FoodStatsPieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3020/stats/most-ordered')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          name: item._id,
          value: item.count,
        }));
        setData(formatted);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2 style={{ textAlign: 'center' }}>🍽️ Most Ordered Food</h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={130}
            label
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FoodStatsPieChart;
