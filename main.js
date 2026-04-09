const startdiv = document.getElementById("start"); // Başlangıç paneli div'i
const btn = document.querySelector("#start button"); // Başlat/Tekrar Dene butonu
const p = document.querySelector("#start p"); // Paneldeki açıklama paragrafı
const killdiv = document.getElementById("kills"); // Öldürme sayısı div'i
const scorediv = document.getElementById("score"); // Skor div'i
const canvas = document.getElementById("canvas"); // Oyun alanı (canvas)
const width = window.innerWidth; // Pencere genişliği
const height = window.innerHeight; // Pencere yüksekliği
canvas.width = width; // Canvas genişliği pencereye ayarlanıyor
canvas.height = height; // Canvas yüksekliği pencereye ayarlanıyor
const ctx = canvas.getContext("2d"); // 2D çizim bağlamı
ctx.clearRect(0,0,width,height); // Canvas temizleniyor

canvas.addEventListener("mousemove",(e)=>{ // Mouse hareketi ile oyuncunun yönü değişiyor
    if(playing){
    var dx = e.pageX - player.x; // X ekseninde fark
    var dy = e.pageY - player.y; // Y ekseninde fark
    var tetha = Math.atan2(dy,dx); // Açı hesaplama
    tetha*=180/Math.PI; // Radyan -> derece
    angle=tetha; // Oyuncunun açısı güncelleniyor
    }

});

canvas.addEventListener("click",(e)=>{ // Mouse tıklanınca
    bullets.push(new Circle(player.x,player.y,e.pageX,e.pageY,5,'white',5)); // Mermi oluştur
    effects.push(new ClickEffect(e.pageX, e.pageY)); // Efekt oluştur
    const ciuvAudio = document.getElementById("ciuv-audio"); // Ses elementi
    if (ciuvAudio) {
        ciuvAudio.currentTime = 0; // Baştan başlat
        ciuvAudio.play(); // Sesi çal
    }
    console.log(bullets); // Konsola mermileri yaz
})

// Daire (mermi ve düşman) sınıfı
class Circle{
    constructor(bx,by,tx,ty,r,c,s){
        this.bx = bx; // Başlangıç x
        this.by = by; // Başlangıç y
        this.tx = tx; // Hedef x
        this.ty = ty; // Hedef y
        this.x = bx; // Anlık x
        this.y = by; // Anlık y
        this.r = r; // Yarıçap
        this.c = c; // Renk
        this.s = s; // Hız
    }
    draw(){
        ctx.fillStyle = this.c; // Renk ayarla
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2); // Daire çiz
        ctx.fill();
        ctx.closePath();
    }
    update(){
        var dx = this.tx - this.bx // Hedefe doğru hareket
        var dy = this.ty - this.by
        var hp = Math.sqrt(dx*dx+dy*dy); // Mesafe
        this.x += (dx / hp) * this.s; // X güncelle
        this.y += (dy / hp) * this.s; // Y güncelle
    }

    remove(){
        if((this.x < 0 || this.x>width) || (this.y < 0 || this.y > height)){
            return true; // Ekran dışına çıktıysa sil
        }
        return false;
    }
}

// Oyuncu sınıfı
class Player{
    constructor(x,y,r,c){
        this.x = x; // X konumu
        this.y = y; // Y konumu
        this.r = r; // Yarıçap
        this.c = c; // Renk
    }
    draw(){
        ctx.save();
        ctx.translate(this.x,this.y); // Oyuncuyu merkeze taşı
        ctx.rotate(angle*Math.PI/180); // Döndür
        ctx.fillStyle= this.c; // Renk
        ctx.beginPath();
        ctx.arc(0,0,this.r,0,Math.PI*2); // Gövde
        ctx.fillRect(0,-(this.r*0.4),this.r + 15,this.r*0.8); // Namlu
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

// Düşman ekleme fonksiyonu
function addEnemy(){
    for(var i = enemies.length;i<maxenemiey;i++){
        var r = Math.random()*30+10; // Rastgele yarıçap
        var color = ' hsl(' + (Math.random()*360)+',50%,50%)'; // Rastgele renk
        var s =0.5+((40 - ((r/40)*r))/160)/maxenemiey; // Hız

        var x,y;
        if(Math.random()<0.5){
            x=(Math.random()>0.5)? width :0; // Kenarlardan başlat
            y=Math.random()*height;
        }else{
            x= Math.random()*width;
            y=(Math.random()>0.5)?height:0;
        }
        enemies.push(new Circle(x,y,player.x,player.y,r,color,s)) // Düşman ekle
    }
}

// Çarpışma kontrolü
function collision(x1,y1,r1,x2,y2,r2){
        var dx = x1-x2;
        var dy = y1-y2;
        var hp = Math.sqrt(dx*dx+dy*dy);
        if(hp<(r1+r2)){
            return true; // Çarpışma varsa
        }
        return false;
}

// Oyun animasyon döngüsü
function animate(){
    if(playing){
    requestAnimationFrame(animate); // Sonsuz döngü
    ctx.fillStyle='rgba(0,0,0,0.1'; // Hafif karartma
    ctx.fillRect(0,0,width,height);
    ctx.fill();
    // Efektleri çiz
    effects.forEach((effect, i) => {
        effect.update();
        effect.draw();
        if(effect.isDone()) effects.splice(i, 1); // Biten efekti sil
    });
    // Düşmanları işle
    enemies.forEach((enemy,e)=>{
        bullets.forEach((bullet,b) => {
        if(collision(enemy.x,enemy.y,enemy.r,bullet.x,bullet.y,bullet.r)){
            if(enemy.r<15){ // Küçük düşman yok olur
            enemies.splice(e,1);
            score += 25;
            kills ++;
            // Seviye sistemi: Her 10 öldürmede seviye artar
            if (kills > 0 && kills % 10 === 0) {
                level++;
                maxenemiey += 2; // Her seviyede 2 yeni düşman
                // Düşmanları daha hızlı yap
                enemies.forEach(enemy => {
                    enemy.s += 0.5; // Hızlarını artır
                });
            }
                if(kills>0 && kills%5 === 0){maxenemiey++;} // Her 5 öldürmede düşman artar
            addEnemy();
        }else{
                enemy.r-=5; // Büyük düşman küçülür
                score +=5;
        }
            bullets.splice(b,1); // Mermiyi sil
            }
        })
        if(collision(enemy.x,enemy.y,enemy.r,player.x,player.y,player.r)){
            startdiv.classList.remove("hidden"); // Paneli göster
            btn.textContent="Tekrar Dene"; // Buton metni
            p.innerHTML="Oyun Bitti <br/> Puan : "+score+"<br/>"+"Öldürme : "+kills; // Sonuç
            playing = false; // Oyun biter
        }
        if(enemy.remove()){
            enemies.splice(e,1); // Ekran dışı düşmanı sil
            addEnemy();
        }
        enemy.update(); // Düşmanı hareket ettir
        enemy.draw(); // Düşmanı çiz
    })
    // Mermileri işle
    bullets.forEach((bullet,b)=>{
        if(bullet.remove()){
            bullets.splice(b,1); // Ekran dışı mermiyi sil
        }
        bullet.update(); // Mermiyi hareket ettir
        bullet.draw(); // Mermiyi çiz
    })
    player.draw(); // Oyuncuyu çiz
    // Seviye göstergesi
    scorediv.innerHTML="Puan : "+score+"<br/>Seviye : "+level; // Skor ve seviye
    killdiv.innerHTML="Öldürme : "+kills; // Öldürme sayısını güncelle
}
}

// Oyun başlatma fonksiyonu
function init(){
    playing=true; // Oyun başlasın
    score = 0; // Skor sıfırla
    kills = 0; // Öldürme sıfırla
    angle = 0; // Açı sıfırla
    bullets = []; // Mermileri temizle
    enemies = []; // Düşmanları temizle
    maxenemiey = 1; // Başlangıç düşman sayısı
    level = 1; // Seviye sıfırla
    startdiv.classList.add("hidden"); // Paneli gizle
    player = new Player(width/2,height/2,20,'white'); // Oyuncu oluştur
    addEnemy(); // Düşman ekle
    animate(); // Animasyonu başlat
}

// Global değişkenler
var playing =false; // Oyun oynanıyor mu?
var player,angle,bullets,enemies,maxenemiey,score,kills;
var level = 1; // Seviye değişkeni eklendi

// Efektler için dizi
var effects = [];

// Efekt sınıfı (tıklama efekti)
class ClickEffect {
    constructor(x, y) {
        this.x = x; // X konumu
        this.y = y; // Y konumu
        this.radius = 0; // Başlangıç yarıçapı
        this.maxRadius = 40 + Math.random() * 20; // Maksimum yarıçap
        this.alpha = 1; // Saydamlık
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha; // Saydamlık uygula
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Daire çiz
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; // Renk
        ctx.lineWidth = 3; // Kalınlık
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.radius += 3; // Büyüt
        this.alpha -= 0.04; // Saydamlığı azalt
    }
    isDone() {
        return this.alpha <= 0; // Bitti mi?
    }
}

// Ekran boyutu değişince canvas'ı otomatik olarak yeniden boyutlandır
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Oyun alanı yeniden boyutlandığında oyuncu ve düşmanlar yeni boyuta göre ayarlanabilir
    // (İsteğe bağlı: oyuncu ortalanabilir veya mevcut konumlar korunabilir)
});
init();








