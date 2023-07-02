"use client"

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ResponseGraph({ data, day = 90 }: { data: { day: string, summery: { [index: string]: { a: number } } }[], day?: number }) {
  const now = new Date().setUTCHours(0, 0, 0, 0) + 86400000;
  const locations: string[] = []
  const processedData = []
  const dataInMs = data.map((checkDay) => ({ ...checkDay, day: new Date(checkDay.day).getTime() }))
  for (let dayBefore = day - 1; dayBefore > -1; dayBefore--) {
    const item = dataInMs.find((checkDay) => checkDay.day === now - 86400000 * dayBefore)
    if (item !== undefined) {
      Object.keys(item.summery).forEach((location) => {
        if (!locations.includes(location)) locations.push(location)
      });
      processedData.push(item)
      continue
    }
    processedData.push({ day: now - 86400000 * dayBefore })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={processedData}
      >
        <CartesianGrid />
        <XAxis mirror dataKey={(data) => data.day} scale='time' axisLine={false} tickLine={false} tick={false} tickMargin={0} />
        <YAxis mirror scale="pow" axisLine={false} tickLine={false} tick={false} tickMargin={0} />
        <Tooltip labelStyle={{ color: '#000' }} labelFormatter={(label, _payload) => new Date(label).toISOString().slice(0, 10)} />
        {/* <Line type="monotone" dot={false} dataKey="ms" stroke="#82ca9d" /> */}
        {locations.map((location) =>
          <Line type="monotone" connectNulls dot={false} dataKey={(d) => d.summery?.[location]?.a ?? null} stroke="#82ca9d" name={location} unit=' ms' key={location} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
