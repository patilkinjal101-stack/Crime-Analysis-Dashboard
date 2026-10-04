const $ = id => document.getElementById(id);
let charts = [];

async function loadData() {
  const area = $('area').value;
  const year = $('year').value;
  const params = new URLSearchParams({ area, year });
  const response = await fetch(`/api/crimes?${params.toString()}`);
  if (!response.ok) throw new Error('Unable to load crime data.');
  return response.json();
}

function sumBy(data, key) {
  const result = {};
  data.forEach(row => result[row[key]] = (result[row[key]] || 0) + row.count);
  return result;
}

function makeChart(id, type, obj) {
  charts.push(new Chart($(id), {
    type,
    data: {
      labels: Object.keys(obj),
      datasets: [{
        label: 'Sample cases',
        data: Object.values(obj),
        backgroundColor: ['#20c6b5','#5b8def','#f2b84b','#a78bfa','#e87979'],
        borderColor: '#20c6b5',
        borderWidth: 2,
        borderRadius: 5,
        tension: .35
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: type === 'doughnut' } },
      scales: type === 'doughnut' ? {} : {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      }
    }
  }));
}

async function update() {
  try {
    const data = await loadData();
    const types = sumBy(data, 'type');
    const areas = sumBy(data, 'area');
    const months = sumBy(data, 'month');

    $('total').textContent = data.reduce((sum, row) => sum + row.count, 0).toLocaleString();
    $('toptype').textContent = Object.entries(types).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
    $('toparea').textContent = Object.entries(areas).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
    $('peak').textContent = Object.entries(months).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

    charts.forEach(chart => chart.destroy());
    charts = [];

    makeChart('types', 'bar', types);
    makeChart('areas', 'doughnut', areas);

    const monthOrder = ['January','February','March','April','May','June','July','August'];
    const orderedMonths = Object.fromEntries(
      monthOrder.filter(month => months[month] !== undefined).map(month => [month, months[month]])
    );
    makeChart('months', 'line', orderedMonths);
  } catch (error) {
    console.error(error);
    $('total').textContent = 'Error';
  }
}

$('area').onchange = update;
$('year').onchange = update;
$('reset').onclick = () => {
  $('area').value = 'All';
  $('year').value = 'All';
  update();
};

update();
