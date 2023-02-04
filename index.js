const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const MOVIES_PER_PAGE = 12 //每個分頁顯示12部電影
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

function renderMovieList(data)
{
  let rawHTML = ''
  data.forEach((item) =>
  {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function getMoviesByPage(page)
{
  //  page 1 -> movie 0 - 11
  //  page 2 -> movie 12 - 23

  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filteredMovies.length ? filteredMovies : movies
  // 如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies(三元運算子)
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  // page 1 -> movie.slice(0,12)
  //回傳新陣列[0,1,2....,11] -> movie 0 - 11
}

function renderPaginator(amount)
{
  //計算總頁數 math.ceil小數點無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++)
  {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click',function(event){
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))


})


function showMovieModal(id)
{
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) =>
  {
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}


// add to favoritemovie function
function addToFavorite(id){

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id))
  {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

// 在 movies 陣列中，識別出被點擊的那部 movie 資料
// 將那部 movie 資料暫存起來
// 暫存起來以後放到收藏清單 list
// 將收藏清單存到 local storage
// 錯誤處理：已經在收藏清單的電影，不應被重複加

}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event)
{
  if (event.target.matches('.btn-show-movie'))
  {
    showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))

  }
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) =>
  {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length) 
  })
  .catch((err) => console.log(err))


  // search bar
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

searchForm.addEventListener('submit', function onSearchFormSubmitted(event)
{
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //儲存符合篩選條件的項目
  let filteredMovies = []
  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0)
  {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重新輸出至畫面
  renderPaginator(filteredMovies.length)  
  renderMovieList(filteredMovies)
})