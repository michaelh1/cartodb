import RecentContentStore from 'new-dashboard/store/modules/recent-content';
import toObject from 'new-dashboard/utils/to-object';
import visualizations from '../../fixtures/visualizations';
import datasets from '../../fixtures/datasets';
import { testAction } from '../helpers';

const getters = RecentContentStore.getters;
const mutations = RecentContentStore.mutations;
const actions = RecentContentStore.actions;

const defaultState = {
  list: {},
  metadata: {},
  error: {},
  isFetching: false,
  isErrored: false
};

const recentContentList = [
  visualizations.visualizations[0],
  visualizations.visualizations[1],
  datasets.visualizations[0]
];

const recentContentResponse = {
  visualizations: recentContentList,
  total_entries: 3
};

describe('RecentContentStore', () => {
  describe('getters', () => {
    describe('hasRecentContent', () => {
      it('should return true if total_entries is greater than 0', () => {
        const state = {
          metadata: { total_entries: 1 }
        };

        expect(getters.hasRecentContent(state)).toBe(true);
      });
    });
  });

  describe('mutations', () => {
    it('setRecentContent', () => {
      const state = {
        ...defaultState,
        isFetching: true
      };

      mutations.setRecentContent(state, recentContentResponse);

      expect(state).toEqual({
        isFetching: false,
        isErrored: false,
        list: toObject(recentContentResponse.visualizations, 'id'),
        error: {},
        metadata: {
          total_entries: recentContentResponse.total_entries
        }
      });
    });

    it('setFetchingState', () => {
      const state = {
        isFetching: false
      };

      mutations.setFetchingState(state);

      expect(state).toEqual({
        isFetching: true,
        isErrored: false,
        error: {}
      });
    });

    it('setRequestError', () => {
      const state = {
        ...defaultState,
        isFetching: true
      };

      const err = { status: 404 };
      mutations.setRequestError(state, err);

      expect(state).toEqual({
        isFetching: false,
        isErrored: true,
        error: err,
        list: {},
        metadata: {}
      });
    });

    it('updateNumberLikes', () => {
      const state = {
        metadata: {
          total_likes: 0
        }
      };

      mutations.updateNumberLikes(state, {
        visualizationId: 'xxxx-yyyy-zzzzz',
        visualizationAttributes: {
          liked: true
        }
      });

      expect(state).toEqual({
        metadata: {
          total_likes: 1
        }
      });
    });
  });

  describe('actions', () => {
    describe('like', () => {
      let state;
      beforeEach(() => {
        state = {
          ...defaultState,
          list: toObject(recentContentResponse.visualizations, 'id')
        };
      });

      it('success', done => {
        const visualizationId = 'e97e0001-f1c2-425e-8c9b-0fb28da59200';

        const expectedActions = [
          {
            type: 'updateVisualization',
            payload: {
              visualizationId,
              visualizationAttributes: {
                liked: true
              }
            }
          }
        ];

        const expectedMutations = [
          { type: 'updateNumberLikes',
            payload: {
              visualizationId,
              visualizationAttributes: {
                liked: true
              }
            }
          }
        ];

        const likeResponse = { id: visualizationId, liked: true };
        const like = (_, callback) => callback(null, null, likeResponse);
        const rootState = {
          client: { like }
        };

        testAction({ action: actions.like, payload: state.list[visualizationId], state, expectedActions, expectedMutations, rootState, done });
      });

      it('errored', done => {
        const visualizationIdErr = 'e97e0001-f1c2-425e-8c9b-0fb28da59200';
        const currentLikeStatus = state.list[visualizationIdErr].liked;

        const expectedActions = [
          {
            type: 'updateVisualization',
            payload: {
              visualizationId: visualizationIdErr,
              visualizationAttributes: {
                liked: true
              }
            }
          },
          {
            type: 'updateVisualization',
            payload: {
              visualizationId: visualizationIdErr,
              visualizationAttributes: {
                liked: currentLikeStatus
              }
            }
          }
        ];

        const likeResponse = { id: visualizationIdErr, liked: true };
        const errResponse = "You've already liked this visualization";
        const like = (_, callback) => callback(errResponse, null, likeResponse);
        const rootState = {
          client: { like }
        };

        testAction({ action: actions.like, payload: state.list[visualizationIdErr], state, expectedActions, rootState, done });
      });
    });

    describe('deleteLike', () => {
      let state;
      beforeEach(() => {
        state = {
          ...defaultState,
          list: toObject(recentContentResponse.visualizations, 'id')
        };
      });

      it('success', done => {
        const visualizationId = '8b378bf8-e74d-4187-9e57-4249db4c0f1f';

        const expectedActions = [
          {
            type: 'updateVisualization',
            payload: {
              visualizationId,
              visualizationAttributes: {
                liked: false
              }
            }
          }
        ];

        const expectedMutations = [
          {
            type: 'updateNumberLikes',
            payload: {
              visualizationId,
              visualizationAttributes: {
                liked: false
              }
            }
          }
        ];

        const deleteLikeResponse = { id: visualizationId, liked: false };
        const deleteLike = (_, callback) => callback(null, null, deleteLikeResponse);
        const rootState = {
          client: { deleteLike }
        };

        testAction({ action: actions.deleteLike, payload: state.list[visualizationId], state, expectedMutations, expectedActions, rootState, done });
      });
    });

    describe('fetch', () => {
      it('success', done => {
        const state = { ...defaultState };

        const expectedMutations = [
          { type: 'setFetchingState' },
          { type: 'setRecentContent', payload: recentContentResponse }
        ];

        const getVisualization = (_1, _2, callback) => callback(null, null, recentContentResponse);
        const rootState = {
          client: { getVisualization }
        };

        testAction({action: actions.fetch, state, expectedMutations, rootState, done});
      });

      it('errored', done => {
        const state = {
          ...defaultState,
          order: false
        };

        const err = { error: "Wrong 'order' parameter value. Valid values are one of [:updated_at, :size, :mapviews, :likes]" };
        const expectedMutations = [
          { type: 'setFetchingState' },
          { type: 'setRequestError', payload: err }
        ];

        const getVisualization = (_1, _2, callback) => callback(err, null, null);
        const rootState = {
          client: { getVisualization }
        };

        testAction({action: actions.fetch, state, expectedMutations, rootState, done});
      });
    });
  });
});
