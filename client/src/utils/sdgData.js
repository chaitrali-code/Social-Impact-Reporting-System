export const sdgGoals = [
  { number: 1, name: 'No Poverty', color: '#E5243B', icon: 'poverty', description: 'End poverty in all its forms everywhere' },
  { number: 2, name: 'Zero Hunger', color: '#DDA63A', icon: 'hunger', description: 'End hunger, achieve food security and improved nutrition' },
  { number: 3, name: 'Good Health and Well-Being', color: '#4C9F38', icon: 'health', description: 'Ensure healthy lives and promote well-being for all' },
  { number: 4, name: 'Quality Education', color: '#C5192D', icon: 'education', description: 'Ensure inclusive and equitable quality education' },
  { number: 5, name: 'Gender Equality', color: '#FF3A21', icon: 'gender', description: 'Achieve gender equality and empower all women and girls' },
  { number: 6, name: 'Clean Water and Sanitation', color: '#26BDE2', icon: 'water', description: 'Ensure availability and sustainable management of water' },
  { number: 7, name: 'Affordable and Clean Energy', color: '#FCC30B', icon: 'energy', description: 'Ensure access to affordable, reliable, sustainable energy' },
  { number: 8, name: 'Decent Work and Economic Growth', color: '#A21942', icon: 'work', description: 'Promote sustained, inclusive and sustainable economic growth' },
  { number: 9, name: 'Industry, Innovation and Infrastructure', color: '#FD6925', icon: 'industry', description: 'Build resilient infrastructure, promote inclusive industrialization' },
  { number: 10, name: 'Reduced Inequalities', color: '#DD1367', icon: 'inequalities', description: 'Reduce inequality within and among countries' },
  { number: 11, name: 'Sustainable Cities and Communities', color: '#FD9D24', icon: 'cities', description: 'Make cities and human settlements inclusive, safe, resilient' },
  { number: 12, name: 'Responsible Consumption and Production', color: '#BF8B2E', icon: 'consumption', description: 'Ensure sustainable consumption and production patterns' },
  { number: 13, name: 'Climate Action', color: '#3F7E44', icon: 'climate', description: 'Take urgent action to combat climate change and its impacts' },
  { number: 14, name: 'Life Below Water', color: '#0A97D9', icon: 'water-life', description: 'Conserve and sustainably use the oceans, seas and marine resources' },
  { number: 15, name: 'Life on Land', color: '#56C02B', icon: 'land-life', description: 'Protect, restore and promote sustainable use of terrestrial ecosystems' },
  { number: 16, name: 'Peace, Justice and Strong Institutions', color: '#00689D', icon: 'peace', description: 'Promote peaceful and inclusive societies for sustainable development' },
  { number: 17, name: 'Partnerships for the Goals', color: '#19486A', icon: 'partnerships', description: 'Strengthen the means of implementation and revitalize partnerships' },
];

export const getSDGByNumber = (number) => sdgGoals.find(sdg => sdg.number === number);

export const getSDGColor = (number) => {
  const sdg = getSDGByNumber(number);
  return sdg ? sdg.color : '#666';
};

export default sdgGoals;
