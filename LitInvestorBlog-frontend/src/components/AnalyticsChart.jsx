// LitInvestorBlog-frontend/src/components/AnalyticsChart.jsx

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

const AnalyticsChart = ({
  type = 'line',
  data = [],
  title,
  description,
  xKey = 'date',
  yKey = 'value',
  color = '#6366f1',
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className = '',
}) => {
  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#84cc16',
  ];

  const formatTooltipValue = (value, name) => {
    if (name === 'revenue' || name === 'donations') {
      return [`€${value.toLocaleString()}`, name];
    }
    return [value.toLocaleString(), name];
  };

  const formatYAxisTick = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatYAxisTick} />
            {showTooltip && <Tooltip formatter={formatTooltipValue} />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatYAxisTick} />
            {showTooltip && <Tooltip formatter={formatTooltipValue} />}
            {showLegend && <Legend />}
            <Bar dataKey={yKey} fill={color} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && <Tooltip formatter={formatTooltipValue} />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );

      case 'multiline': {
        const keys = Object.keys(data[0] || {}).filter((key) => key !== xKey);
        return (
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3"/>}
              <XAxis dataKey={xKey}/>
              <YAxis tickFormatter={formatYAxisTick}/>
              {showTooltip && <Tooltip formatter={formatTooltipValue}/>}
              {showLegend && <Legend/>}
              {keys.map((key, index) => (
                  <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{r: 4}}
                  />
              ))}
            </LineChart>
        );
      }

      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatYAxisTick} />
            {showTooltip && <Tooltip formatter={formatTooltipValue} />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Nessun dato disponibile</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export const ArticlesOverTimeChart = ({ data, ...props }) => (
  <AnalyticsChart
    type="area"
    data={data}
    title="Articoli nel Tempo"
    description="Numero di articoli pubblicati per periodo"
    xKey="date"
    yKey="articles"
    color="#10b981"
    {...props}
  />
);

export const UsersGrowthChart = ({ data, ...props }) => (
  <AnalyticsChart
    type="line"
    data={data}
    title="Crescita Utenti"
    description="Nuovi utenti registrati per periodo"
    xKey="date"
    yKey="users"
    color="#6366f1"
    {...props}
  />
);

export const RevenueChart = ({ data, ...props }) => (
  <AnalyticsChart
    type="bar"
    data={data}
    title="Entrate"
    description="Donazioni ricevute per periodo"
    xKey="date"
    yKey="revenue"
    color="#f59e0b"
    {...props}
  />
);

export const CategoriesChart = ({ data, ...props }) => (
  <AnalyticsChart
    type="pie"
    data={data}
    title="Articoli per Categoria"
    description="Distribuzione degli articoli per categoria"
    xKey="name"
    yKey="count"
    {...props}
  />
);

export const AuthorsChart = ({ data, ...props }) => (
  <AnalyticsChart
    type="bar"
    data={data}
    title="Top Autori"
    description="Autori più attivi per numero di articoli"
    xKey="author"
    yKey="articles"
    color="#8b5cf6"
    {...props}
  />
);

export const EngagementChart = ({ data, ...props }) => (
  <AnalyticsChart
    type="multiline"
    data={data}
    title="Engagement"
    description="Mi piace, commenti e condivisioni nel tempo"
    xKey="date"
    showLegend={true}
    {...props}
  />
);

export default AnalyticsChart;
