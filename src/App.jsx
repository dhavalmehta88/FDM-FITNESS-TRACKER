import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [foodEntries, setFoodEntries] = useState(() => JSON.parse(localStorage.getItem('foodEntries')) || []);
  const [workoutEntries, setWorkoutEntries] = useState(() => JSON.parse(localStorage.getItem('workoutEntries')) || []);
  const [weights, setWeights] = useState(() => JSON.parse(localStorage.getItem('weights')) || []);
  const [form, setForm] = useState({
    person: 'Dhaval',
    type: 'food',
    item: '',
    calories: '',
    weight: ''
  });

  useEffect(() => {
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
  }, [foodEntries]);

  useEffect(() => {
    localStorage.setItem('workoutEntries', JSON.stringify(workoutEntries));
  }, [workoutEntries]);

  useEffect(() => {
    localStorage.setItem('weights', JSON.stringify(weights));
  }, [weights]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addEntry = () => {
    if (!form.item || !form.calories) return;
    const entry = {
      ...form,
      calories: parseInt(form.calories),
      date: new Date().toLocaleDateString()
    };
    if (form.type === 'food') {
      setFoodEntries([...foodEntries, entry]);
    } else {
      setWorkoutEntries([...workoutEntries, entry]);
    }
    if (form.weight) {
      setWeights([...weights, { person: form.person, weight: parseFloat(form.weight), date: entry.date }]);
    }
    setForm({ ...form, item: '', calories: '', weight: '' });
  };

  const totalCalories = (person, list) =>
    list.filter(e => e.person === person).reduce((sum, e) => sum + e.calories, 0);

  const netCalories = (person, tdee) =>
    tdee - (totalCalories(person, foodEntries) - totalCalories(person, workoutEntries));

  const exportToExcel = () => {
    const allEntries = [
      ...foodEntries.map(e => ({ ...e, type: 'Food' })),
      ...workoutEntries.map(e => ({ ...e, type: 'Workout' })),
      ...weights.map(e => ({ ...e, type: 'Weight' }))
    ];
    const worksheet = XLSX.utils.json_to_sheet(allEntries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log");
    XLSX.writeFile(workbook, "Fitness_Report.xlsx");
  };

  const chartData = {
    labels: ['Dhaval', 'Foram'],
    datasets: [
      {
        label: 'Food Calories',
        data: ['Dhaval', 'Foram'].map(p => totalCalories(p, foodEntries)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      },
      {
        label: 'Workout Calories',
        data: ['Dhaval', 'Foram'].map(p => totalCalories(p, workoutEntries)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Calorie Summary' }
    },
    scales: {
      x: { type: 'category' },
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="p-6 grid gap-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">FDM Fitness Tracker</h1>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-2">
          <select name="person" value={form.person} onChange={handleChange} className="border rounded p-2">
            <option value="Dhaval">Dhaval</option>
            <option value="Foram">Foram</option>
          </select>
          <select name="type" value={form.type} onChange={handleChange} className="border rounded p-2">
            <option value="food">Food</option>
            <option value="workout">Workout</option>
          </select>
        </div>
        <input name="item" placeholder="Item/Activity" value={form.item} onChange={handleChange} className="border rounded p-2" />
        <input name="calories" type="number" placeholder="Calories" value={form.calories} onChange={handleChange} className="border rounded p-2" />
        <input name="weight" type="number" placeholder="(Optional) Weight in kg" value={form.weight} onChange={handleChange} className="border rounded p-2" />
        <button onClick={addEntry} className="bg-blue-500 text-white py-2 px-4 rounded">Add Entry</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {['Dhaval', 'Foram'].map(person => (
          <div key={person} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{person}</h2>
            <p>Total Food: {totalCalories(person, foodEntries)} kcal</p>
            <p>Total Workout: {totalCalories(person, workoutEntries)} kcal</p>
            <p>Net Deficit: {netCalories(person, person === 'Dhaval' ? 2085 : 1628)} kcal</p>
            <p>Latest Weight: {weights.filter(w => w.person === person).slice(-1)[0]?.weight || 'N/A'} kg</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Calorie Summary Chart</h2>
        <Bar data={chartData} options={chartOptions} />
        <button onClick={exportToExcel} className="bg-green-600 text-white py-2 px-4 rounded mt-4">Download Excel Report</button>
      </div>
    </div>
  );
}
