        // Função para controlar o carrossel de fotos (Manual e Automático)
        function moveSlide(carouselOrBtn, direction) {
            let carousel;
            if (carouselOrBtn.classList && carouselOrBtn.classList.contains('class-carousel')) {
                carousel = carouselOrBtn;
            } else {
                carousel = carouselOrBtn.closest('.class-carousel');
            }

            const track = carousel.querySelector('.carousel-track');
            const slides = track.querySelectorAll('.carousel-slide');

            let currentIndex = parseInt(carousel.dataset.index || '0');

            currentIndex += direction;

            if (currentIndex >= slides.length) {
                currentIndex = 0;
            } else if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            }
            carousel.dataset.index = currentIndex;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        // Passagem automática dos carrosséis a cada 3.5 segundos
        document.addEventListener("DOMContentLoaded", () => {
            const carousels = document.querySelectorAll('.class-carousel');
            carousels.forEach(carousel => {
                setInterval(() => {
                    moveSlide(carousel, 1);
                }, 3500);
            });
        });
        let deferredPrompt;
        const installBtn = document.getElementById('install-btn');

        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            document.getElementById('desktop-warning').style.display = 'block';
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js').catch(() => { });
            });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (installBtn) {
                installBtn.style.display = 'inline-flex';
            }
        });

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('Usuário aceitou instalar o PWA');
                }
                deferredPrompt = null;
                return;
            }

            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isMobile) {
                window.location.href = 'PWA_Aluno.html';
                return;
            }

            alert("Para instalar o app da Academia THOR, acesse pelo menu do seu navegador e selecione 'Adicionar à Tela Inicial'.");
        });