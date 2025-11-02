import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EloPoint {
  timestamp: string; // ISO date
  elo: number;
}

export default function EloChart({ userId }: { userId: string }) {
  const [dataPoints, setDataPoints] = useState<EloPoint[]>([]);
  useEffect(() => {
    let mounted = true;
    import { supabase } from '@/integrations/supabase/client';
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('elo_history').select('*').eq('user_id', userId).order('timestamp', { ascending: true });
        if (error) throw error;
        setDataPoints(data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    // No polling; the chart updates when the page reloads or after elo update triggers frontend refetch.
    return () => { mounted = false; };
  }, [userId]);

  const chartData = {
    labels: dataPoints.map(p => new Date(p.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'ELO',
        data: dataPoints.map(p => p.elo),
        tension: 0.3,
        fill: false,
      },
    ],
  };

  return (
    <div>
      <Line data={chartData} />
    </div>
  );
}
