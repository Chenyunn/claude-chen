import { createStore } from 'vuex';
import { getToken, removeToken, setToken } from '@/utils/api';
import type { User } from '@/types';

export interface State {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const state: State = {
  token: getToken(),
  user: null,
  isAuthenticated: !!getToken(),
};

const mutations = {
  SET_TOKEN(state: State, token: string | null) {
    state.token = token;
    state.isAuthenticated = !!token;
    if (token) {
      setToken(token);
    } else {
      removeToken();
    }
  },
  SET_USER(state: State, user: User | null) {
    state.user = user;
  },
};

const actions = {
  /**
   * 用户注册
   */
  async register(
    { commit }: { commit: (type: string, payload: any) => void },
    payload: { username: string; password: string; nickname?: string }
  ) {
    const { default: api } = await import('@/utils/api');
    const result = await api.post('/auth/register', payload);
    if (result.data && result.data.token) {
      commit('SET_TOKEN', result.data.token);
      commit('SET_USER', result.data.user);
    }
    return result;
  },

  /**
   * 用户登录
   */
  async login(
    { commit }: { commit: (type: string, payload: any) => void },
    payload: { username: string; password: string; rememberMe?: boolean }
  ) {
    const { default: api } = await import('@/utils/api');
    const result = await api.post('/auth/login', payload);
    if (result.data && result.data.token) {
      commit('SET_TOKEN', result.data.token);
      commit('SET_USER', result.data.user);
    }
    return result;
  },

  /**
   * 用户登出
   */
  async logout({ commit }: { commit: (type: string, payload: any) => void }) {
    const { default: api } = await import('@/utils/api');
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
    }
  },

  /**
   * 获取当前用户信息
   */
  async fetchUser({ commit }: { commit: (type: string, payload: any) => void }) {
    const { default: api } = await import('@/utils/api');
    const result = await api.get('/auth/me');
    if (result.data) {
      commit('SET_USER', result.data);
    }
    return result;
  },

  /**
   * 检查认证状态
   */
  async checkAuth(
    { dispatch, commit }: { dispatch: (type: string, payload: any) => void; commit: (type: string, payload: any) => void }
  ): Promise<boolean> {
    const token = getToken();
    if (!token) {
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
      return false;
    }

    try {
      await dispatch('fetchUser', undefined);
      return true;
    } catch (e) {
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
      return false;
    }
  },

  /**
   * 更新用户信息
   */
  async updateUser(
    { commit }: { commit: (type: string, payload: any) => void },
    payload: Partial<User>
  ) {
    const { default: api } = await import('@/utils/api');
    const result = await api.patch('/auth/me', payload);
    if (result.data) {
      commit('SET_USER', result.data);
    }
    return result;
  },
};

const getters = {
  isAuthenticated: (state: State) => state.isAuthenticated,
  currentUser: (state: State) => state.user,
};

export default createStore({
  state,
  mutations,
  actions,
  getters,
});
