const button = document.querySelector('.gen-button');
const suggestionDiv = document.querySelector('.suggestion');

button.addEventListener('click', () => {
    fetch('http://127.0.0.1:3000/generate_buy')
        .then(response => response.json())
        .then(data => {
            const { recommended_footware, recommended_bottomware, recommended_topware } = data;
            // Display the recommendations
            suggestionDiv.innerHTML = `
                
                <div class="recommendation-card">
                    <h3>Recommended Topware</h3>
                    <div class="card-container">
                        ${recommended_topware.map(item => `
                            <div class="card">
                                <img src="${item.topware.image.substr(21)}" alt="Topware" class="card-img">
                                <div class="card-body">
                                    <h4 class="card-title">${item.topware.name}</h4>
                                    <p class="card-text">Score: ${item.average_score}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="recommendation-card">
                    <h3>Recommended Bottomware</h3>
                    <div class="card-container">
                        ${recommended_bottomware.map(item => `
                            <div class="card">
                                <img src="${item.bottomware.image.substr(21)}" alt="Bottomware" class="card-img">
                                <div class="card-body">
                                    <h4 class="card-title">${item.bottomware.name}</h4>
                                    <p class="card-text">Score: ${item.average_score}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="recommendation-card">
                    <h3>Recommended Footware</h3>
                    <div class="card-container">
                        ${recommended_footware.map(item => `
                            <div class="card">
                                <img src="${item.footware.image.substr(21)}" alt="Footware" class="card-img">
                                <div class="card-body">
                                    <h4 class="card-title">${item.footware.name}</h4>
                                    <p class="card-text">Score: ${item.average_score}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});
