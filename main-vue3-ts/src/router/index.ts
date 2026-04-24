import { ElMessage } from "element-plus";
import { createRouter, createWebHistory } from "vue-router";
import NotFound from "../components/404.vue";
import MicroAppContainer from "../components/MicroAppContainer.vue";
import Layout from "../layout/index.vue";

const routes = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../views/home.vue"),
        meta: { title: "首页", isMenu: true, isAuth: true },
      },
      {
        path: "son01-vue3-ts/:pathMatch(.*)*",
        name: "son01-vue3-ts",
        component: MicroAppContainer,
        meta: { title: "Vue3 子应用", isMenu: true, isAuth: true },
      },
      {
        path: "son02-react-ts/:pathMatch(.*)*",
        name: "son02-react-ts",
        component: MicroAppContainer,
        meta: { title: "React 子应用", isMenu: true, isAuth: true },
      },
      {
        path: "element-test",
        name: "element-test",
        component: () => import("../views/element-test.vue"),
        meta: { title: "Element Plus 测试", isMenu: true, isAuth: true },
      },
    ],
  },
  {
    path: "/login",
    component: () => import("../views/login.vue"),
    meta: { isMenu: false, isAuth: false },
  },

  {
    path: "/404",
    component: NotFound,
    meta: { isMenu: false, isAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    meta: { isMenu: false, isAuth: false },
  },
];

// 路由模式必须为history模式,否则会报错
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const token = (JSON.parse(localStorage.getItem("user") as string)?.token ||
  "") as string;

router.beforeEach((to, from, next) => {
  if (to.meta.isAuth && !token) {
    next("/login");
    ElMessage.warning("请先登录");
  } else {
    next();
  }
});

export { routes };
export default router;
