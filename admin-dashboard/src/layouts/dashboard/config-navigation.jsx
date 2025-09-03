import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------
const data = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData')).data;

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);
console.log(data, 'data')

const adminRoutes = data?.type === 'super_admin' ? [
  {
    title: 'Users',
    path: '/user',
    icon: icon('ic_user'),
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: icon('ic_report'),
  }
] : [];

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_dashboard'),
  },
  {
    title: 'orders',
    path: '/orders',
    icon: icon('ic_order'),
  },
  {
    title: 'product',
    path: '/products',
    icon: icon('ic_product'),
  },
  ...adminRoutes,
  {
    title: 'Questions',
    path: '/questions',
    icon: icon('ic_customer'),
  },
  {
    title: 'Quality Report',
    path: '/quality-report',
    icon: icon('ic_report'),
  },
];


export default navConfig;
