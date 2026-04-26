const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const newFunc = `async function getStats(){
  try {
    const res = await fetch('https://foodpicker.kr/api/stats');
    const d = await res.json();
    return {
      today: d.todayVisits,
      month: d.monthVisits,
      total: d.totalVisits,
      totalMenus: d.totalMenus,
      coupangClicks: d.coupangClicks,
      weekly: d.last7,
      topMenus: d.topMenus,
      categories: d.categories,
      genders: d.genders,
      ages: d.ages
    };
  } catch(e) {
    return {today:0,month:0,total:0,totalMenus:0,coupangClicks:0,weekly:[],topMenus:[],categories:[],genders:[],ages:[]};
  }
}`;

const oldFunc = /function getStats\(\)\{[\s\S]*?\n\}/;
html = html.replace(oldFunc, newFunc);
fs.writeFileSync('admin.html', html);
console.log('완료!');