class Pokemon {
    constructor() {
        this.number = 0;
        this.name = "";
        this.types = [];
        this.type = "";
        this.photo = "";
    }
}

class pokeApi {
    static async getPokemonDetail(pokemon) {
        const response = await fetch(pokemon.url);
        const pokeDetail = await response.json();
        const newPokemon = new Pokemon();
        newPokemon.number = pokeDetail.id;
        newPokemon.name = pokeDetail.name;

        const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
        const [type] = types;

        newPokemon.types = types;
        newPokemon.type = type;

        newPokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

        return newPokemon;
    }

    static async getPokemons(offset = 0, limit = 5) {
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonBody = await response.json();
            if (!jsonBody || !jsonBody.results) {
                throw new Error("API response is missing expected data.");
            }

            const pokemons = jsonBody.results;
            const detailRequests = pokemons.map(pokeApi.getPokemonDetail);
            const pokemonsDetails = await Promise.all(detailRequests);

            return pokemonsDetails;
        } catch (error) {
            console.error("Error fetching Pokemon data:", error);
            throw error; // Propagar o erro para quem chamou a função
        }
    }
}

class Pokedex extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({
            mode: "open"
        });

        this.offset = 0;
        this.limit = 10;
        this.page = 0;

        shadow.appendChild(this.styles());
        shadow.appendChild(this.main());
    };

    async loadPokemonItems() {
        try {
            const pokemons = await pokeApi.getPokemons(this.offset, this.limit);
            const list = document.createElement("ol");
            list.setAttribute("id", "pokemonList");
            list.setAttribute("class", "pokemons");
            const pokemonList = this.shadowRoot.querySelector('.pokemons');

            if (pokemonList) {
                pokemonList.innerHTML = '';
                list.innerHTML += ''; // Limpa o conteúdo existente
            }

            const newHtml = pokemons.map(pokemon => {
                const pokemonHtml = this.builds(pokemon);
                return pokemonHtml.outerHTML;

            }).join('');
            list.innerHTML += newHtml;
            return list;

        } catch (error) {
            console.error("Error loading Pokemon items:", error);
        }
    }

    main() {
        const componetRoot = document.createElement("section");
        componetRoot.innerHTML = `<h1>Pokedex</h1>`;
        this.loadPokemonItems().then(pokemonList => {
            componetRoot.appendChild(pokemonList);
        });
        return componetRoot;
    }

    loadMoreButton() {
        try {
            const componentLoadMore = document.createElement("div");
            componentLoadMore.setAttribute("class", "pagination");
            const loadMoreButton = document.createElement("button");
            loadMoreButton.setAttribute("id", "loadMoreButton");
            loadMoreButton.setAttribute("type", "button");
            loadMoreButton.textContent = "Carregar mais";
            loadMoreButton.addEventListener('click', () => {
                this.limit += 10;
                this.page += 1;
                this.main();
                this.updateButtonsVisibility(componentLoadMore);
            });

            const loadLessButton = document.createElement("button");
            loadLessButton.setAttribute("id", "loadLessButton");
            loadLessButton.setAttribute("type", "button");
            loadLessButton.textContent = "Carregar menos";
            loadLessButton.addEventListener('click', () => {
                this.limit -= 10;
                this.page -= 1;
                this.main();
                this.updateButtonsVisibility(componentLoadMore);
            });
            componentLoadMore.appendChild(loadMoreButton);
            componentLoadMore.appendChild(loadLessButton);

            // Inicialmente, atualize a visibilidade dos botões
            this.updateButtonsVisibility(componentLoadMore);

            return componentLoadMore;
        }
        catch (error) {
            console.error("Error loading Pokemon items:", error);
            return null;
        }
    }

    updateButtonsVisibility(componentLoadMore) {
        if (this.page == 0) {
            componentLoadMore.querySelector("#loadMoreButton").style.display = "block";
            componentLoadMore.querySelector("#loadLessButton").style.display = "none";
        } else {
            componentLoadMore.querySelector("#loadMoreButton").style.display = "block";
            componentLoadMore.querySelector("#loadLessButton").style.display = "block";
        }
    }

    builds(pokemon) {
        if (pokemon) {
            const componetBuild = document.createElement("li");
            componetBuild.setAttribute("class", `pokemon ${pokemon.type}`);
            componetBuild.innerHTML += `
                <span class="number">#${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>

                <div class="detail">
                    <ol class="types">
                        ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                    </ol>    
                    <img src="${pokemon.photo}"
                    alt="${pokemon.name}">
                </div>
            </li>`;
            return componetBuild;
        }
    };

    styles() {
        const style = document.createElement("style");
        style.textContent = `

            h1 {
                font-size: 2em;
                margin: 0.67em 0;
            }

            .pokemons {
                display: grid;
                grid-template-columns: 1fr;
                margin: 0;
                padding: 0;
                list-style: none;
            }

            .normal {
                background-color: #a6a877;
            }
            
            .grass {
                background-color: #49d0b0;
            }
            
            .fire {
                background-color: #ee7f30;
            }
            
            .water {
                background-color: #678fee;
            }
            
            .electric {
                background-color: #f7cf2e;
            }
            
            .ice {
                background-color: #98d5d7;
            }
            
            .ground {
                background-color: #dfbf69;
            }
            
            .flying {
                background-color: #a98ff0;
            }
            
            .poison {
                background-color: #a040a0;
            }
            
            .fighting {
                background-color: #bf3029;
            }
            
            .psychic {
                background-color: #f65687;
            }
            
            .dark {
                background-color: #725847;
            }
            
            .rock {
                background-color: #b8a137;
            }
            
            .bug {
                background-color: #a8b720;
            }
            
            .ghost {
                background-color: #6e5896;
            }
            
            .steel {
                background-color: #b9b7cf;
            }
            
            .dragon {
                background-color: #6f38f6;
            }
            
            .fairy {
                background-color: #f9aec7;
            }
            
            .pokemon {
                display: flex;
                flex-direction: column;
                margin: .5rem;
                padding: 1rem;
                border-radius: 1rem;
            }
            
            .pokemon .number {
                color: #000;
                opacity: .3;
                text-align: right;
                font-size: .625rem;
            }
            
            .pokemon .name {
                text-transform: capitalize;
                color: #fff;
                margin-bottom: .25rem;
            }
            
            .pokemon .detail {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
            
            .pokemon .detail .types {
                padding: 0;
                margin: 0;
                list-style: none;
            }
            
            .pokemon .detail .types .type {
                color: #fff;
                padding: .25rem .5rem;
                margin: .25rem 0;
                font-size: .625rem;
                border-radius: 1rem;
                filter: brightness(1.1);
                text-align: center;
            }
            
            .pokemon .detail img {
                max-width: 100%;
                height: 70px;
            }

            .pagination {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                width: 100%;
                padding: 1rem;
            }
            
            .pagination button {
                padding: .25rem .5rem;
                margin: .25rem 0;
                font-size: .625rem;
                color: #fff;
                background-color: #6c79db;
                border: none;
                border-radius: 1rem;
            }
            
            .content {
                display: block;
                width: 100vw;
                height: 100vh;
                padding: 1rem;
                background-color: #fff;
            }
            
            @media screen and (min-width: 380px) {
                .pokemons {
                    grid-template-columns: 1fr 1fr;
                }
            }
            
            @media screen and (min-width: 576px) {
                .pokemons {
                    grid-template-columns: 1fr 1fr 1fr;
                }
            }
            
            @media screen and (min-width: 992px) {
                .pokemons {
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                }

                .content {
                    display: block;
                    max-width: 992px;
                    height: auto;
                    margin: 1rem auto;
                    border-radius: 1rem;
                }
            }`;
        return style;
    };
}
customElements.define("meu-pokedex", Pokedex);
