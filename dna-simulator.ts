// 塩基の型定義
type Base = 'A' | 'T' | 'G' | 'C';

// ヌクレオチド（核酸）のインターフェース
interface Nucleotide {
    base: Base;
    x: number;
    y: number;
    targetY: number; // 物理演算用の目標位置
}

class DNASimulator {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private strandA: Nucleotide[] = [];
    private strandB: Nucleotide[] = [];
    
    // シミュレーションのパラメータ
    private numPairs = 30;       // 塩基対の数
    private spacing = 25;        // 塩基間の間隔(px)
    private amplitude = 40;      // らせんの半径（振幅）
    private speed = 0.05;        // 回転・移動速度
    private time = 0;            // 時間経過カウント

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) throw new Error('Canvasの初期化に失敗しました。');
        this.ctx = context;

        this.initCanvas();
        this.initDNA();
        this.animate();
    }

    // キャンバスサイズの設定
    private initCanvas(): void {
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = 400;
    }

    // 相補的な塩基をランダムに生成
    private getRandomBase(): { a: Base; b: Base } {
        const pairs: { a: Base; b: Base }[] = [
            { a: 'A', b: 'T' },
            { a: 'T', b: 'A' },
            { a: 'G', b: 'C' },
            { a: 'C', b: 'G' }
        ];
        return pairs[Math.floor(Math.random() * pairs.length)];
    }

    // DNAの初期配置
    private initDNA(): void {
        const startX = (this.canvas.width - (this.numPairs * this.spacing)) / 2;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < this.numPairs; i++) {
            const { a, b } = this.getRandomBase();
            const x = startX + (i * this.spacing);

            this.strandA.push({ base: a, x, y: centerY, targetY: centerY });
            this.strandB.push({ base: b, x, y: centerY, targetY: centerY });
        }
    }

    // 塩基に応じた色を取得
    private getBaseColor(base: Base): string {
        switch (base) {
            case 'A': return '#FF4B4B'; // 赤
            case 'T': return '#4B7BFF'; // 青
            case 'G': return '#FFB34B'; // オレンジ
            case 'C': return '#4BFF7B'; // 緑
        }
    }

    // 物理・座標の更新（可動ロジック）
    private update(): void {
        this.time += this.speed;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < this.numPairs; i++) {
            // 正弦波（Sine wave）を使って二重らせんの回転運動をシミュレート
            // 鎖Aと鎖Bは位相を「π（180度）」ずらすことで対向させる
            const phaseOffset = i * 0.5; 
            
            this.strandA[i].targetY = centerY + Math.sin(this.time + phaseOffset) * this.amplitude;
            this.strandB[i].targetY = centerY + Math.sin(this.time + phaseOffset + Math.PI) * this.amplitude;

            // イージング（滑らかな動きの適用）
            this.strandA[i].y += (this.strandA[i].targetY - this.strandA[i].y) * 0.2;
            this.strandB[i].y += (this.strandB[i].targetY - this.strandB[i].y) * 0.2;
        }
    }

    // 描画処理
    private draw(): void {
        // 画面クリア
        this.ctx.fillStyle = '#1e1e1e'; // ダークモード背景
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. 塩基対（結合線）の描画
        for (let i = 0; i < this.numPairs; i++) {
            const pA = this.strandA[i];
            const pB = this.strandB[i];
            const midY = (pA.y + pB.y) / 2;

            // 鎖A側の結合線
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getBaseColor(pA.base);
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(pA.x, pA.y);
            this.ctx.lineTo(pA.x, midY);
            this.ctx.stroke();

            // 鎖B側の結合線
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getBaseColor(pB.base);
            this.ctx.moveTo(pB.x, midY);
            this.ctx.lineTo(pB.x, pB.y);
            this.ctx.stroke();
        }

        // 2. 主鎖（バックボーン）とノードの描画
        this.drawStrand(this.strandA);
        this.drawStrand(this.strandB);
    }

    // 鎖ごとの描画ヘルパー
    private drawStrand(strand: Nucleotide[]): void {
        // バックボーンの線
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < strand.length; i++) {
            if (i === 0) this.ctx.moveTo(strand[i].x, strand[i].y);
            else this.ctx.lineTo(strand[i].x, strand[i].y);
        }
        this.ctx.stroke();

        // 各塩基の丸（ノード）
        for (const n of strand) {
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getBaseColor(n.base);
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    // ループ処理
    private animate = (): void => {
        this.update();
        this.draw();
        requestAnimationFrame(this.animate);
    }
}

// 実行（DOMマウント後を想定）
window.addEventListener('DOMContentLoaded', () => {
    new DNASimulator('dnaCanvas');
});