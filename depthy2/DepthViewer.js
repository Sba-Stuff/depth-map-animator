

	function DepthViewer() {
		Sprite.call(this);
		
		var cont = this.cont = new Sprite();  this.addChild(cont);
		
		var obj = this.obj = new Sprite();  cont.addChild(obj);
		//obj.z = -2;  cont.z=2;
		
		
		var src = "car";
		//src="cube_mini";
		//src="tulips";
		//src="flowers";
		//src="man";
		//src="plate";
		//src="face";
		
		var dm = new BitmapData("samp/"+src+"_depth.png");
		dm.loader.addEventListener2(Event.COMPLETE,this._loaded,this);
		
		this._dm = null;
		
		var bd = this.bd = new BitmapData("samp/"+src+".jpg");
		
		this.addEventListener2(Event.ENTER_FRAME, this.onEF, this);
	}
	DepthViewer.prototype = new Sprite();
	
	DepthViewer.prototype.SetBitmap = function(img,w,h,depth) {
		if(!depth) {
			this.bd = BitmapData.empty(w,h,0xffffffff);
			this.bd.setPixels(new Rectangle(0,0,w,h),img);
		}
		else {
			var map = new Uint8Array(w*h);
			for(var i=0; i<map.length; i++) map[i] = img[i*4];
			//if(this._dm) for(var i=0; i<map.length; i++) if(map[i]!=this._dm[0][i]) {  console.log(i);  break;  }
			this._dm = [map,w,h];
		}
		this._redraw();
	}
	
	DepthViewer.prototype.uiresize = function(w,h) {
		var c = this.cont;
		c.x = w/2;
		c.y = h/2;
		c.scaleX = c.scaleY = 1.05*Math.min(w,h)/2;
		c.scaleZ = 400;
	}
	
	DepthViewer.prototype.onEF = function(e) {
		var c = this.cont;
		
		var min = Math.min(c.x,c.y);
		var dx = ((this.mouseX-c.x)/min);
		var dy = ((this.mouseY-c.y)/min);
		
		c.rotationY += (-dx*5 - c.rotationY)*0.1;
		c.rotationX += ( dy*5 - c.rotationX)*0.1;
		
		this.obj.x = -c.rotationY*0.03;
		this.obj.y =  c.rotationX*0.03;
		
	}
	
	DepthViewer.prototype._loaded = function(e) {
		var dm = e.target.bitmapData;
		var px = dm.getPixels(dm.rect), w=dm.rect.width, h=dm.rect.height,area=w*h;
		var map = new Uint8Array(area);
		for(var i=0; i<area; i++) map[i]=px[i*4];
		
		this._dm = [map,w,h];
		
		this._redraw();
	}
	
	DepthViewer.prototype._redraw = function() {
		var vs=[],  is=[],  uv=[];
		var dm = this._dm, depths=dm[0], w=dm[1], h=dm[2];
		
		var ox=-1, oy=-1, sx = 2/w, sy = 2/h;
		if(w>h) {  oy=-h/w;  sy*=h/w;  }  else {  ox=-w/h;  sx*=w/h;  }
		
		
		var ww=w+1, hh=h+1;
		var cdist = 1.3; // distance between camera and a projection plane
		
		var stp = Math.max(1, Math.floor((w+h)/1000));  
		var iw = Math.floor(w/stp)+1;
		var ih = Math.floor(h/stp)+1;
		
		
		for(var y=0; y<=h; y+=stp)
			for(var x=0; x<=w; x+=stp) {
				var di = Math.min(y,h-1)*w+Math.min(x,w-1);
				var depth = (255-depths[di])*(1/255);
				depth = Math.exp(depth*1)-1;
				
				var px = ox+x*sx, py = oy+y*sy, pz=0;
				var dst = Math.sqrt(px*px + py*py + (pz+cdist)*(pz+cdist));
				var frc = (depth+dst)/dst;
				px*=frc;  py*=frc;  pz = (pz+cdist)*frc-cdist;
				
				vs.push(px,py,pz);
				uv.push(x/w, y/h);
				var iy=Math.floor(y/stp);
				var ix=Math.floor(x/stp);
				if(ix+1<iw && iy+1<ih) {
					var i0=iy*iw+ix, i1=iy*iw+ix+1, i2=(iy+1)*iw+ix, i3=(iy+1)*iw+ix+1;
					is.push(i0,i1,i2, i1,i2,i3);
				}
			}
		
		var gr = this.obj.graphics;
		gr.clear();
		gr.beginBitmapFill(this.bd);
		gr.drawTriangles3D(vs, is, uv);
	}