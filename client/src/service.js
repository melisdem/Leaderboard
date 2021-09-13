import http from "./http-common";

class DataService {
  getDay() {
    return http.get(`users/endOfTheDay`)
  }
  getWeek() {
    return http.get(`/users/endOfTheWeek`)
  }
  get(id) {
    return http.get(`/users/${id}`)
  }
}

export default new DataService();