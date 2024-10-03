"use client"

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ResponseGraph({ data, day = 1, local = true }: { data: any[], day?: number, local?: boolean }) {
  const now = local ? Date.now() : new Date().setUTCHours(0, 0, 0, 0) + 86400000;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={[{ t: now - 86400000 * day }].concat(data.filter((checkDay) => checkDay.t > now - 86400000 * day && checkDay.t < now - 86400000 * (day - 1)), [{ t: now - 86400000 * (day - 1) }])}
      >
        <CartesianGrid />
        <XAxis mirror dataKey={(data) => new Date(data.t)} scale='time' axisLine={false} tickLine={false} tick={false} tickMargin={0} />
        <YAxis mirror scale="pow" axisLine={false} tickLine={false} tick={false} tickMargin={0} />
        <Tooltip labelStyle={{ color: '#000' }} labelFormatter={(label, _payload) => new Date(label).toISOString().replace('T', ' ').split('.')[0]} />
        {/* <Line type="monotone" dot={false} dataKey="ms" stroke="#82ca9d" /> */}
        <Line type="monotone" dot={false} dataKey={(d) => {
          if (!d.ms) return undefined
          const index = data.indexOf(d);
          let sum = 0;
          for (let i = -3; i < 4; i++) {
            sum += data[index + i] ? data[index + i].ms : d.ms;
          }
          return Math.round(sum / 7)
        }} stroke="#82ca9d" unit=' ms' />
      </LineChart>
    </ResponsiveContainer>
  )
}
