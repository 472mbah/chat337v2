import { createStore } from 'redux';
import rootReducer from '../reducers';

let rootStore = createStore(rootReducer);

export default rootStore;

