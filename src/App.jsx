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
    XLSX.utils.book_append_sheet(workbook, worksheet, \"Log\");
    XLSX.writeFile(workbook, \"Fitness_Report.xlsx\");
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
      x:
