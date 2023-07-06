precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D sampler;

void main()
{
   const float Pi = 6.28318530718;
    
   const float Directions = 16.0;
   const float Quality = 4.0;

   float Radius = 0.025;

   vec4 Color = vec4(0);

   for(float d = 0.0; d<Pi; d += Pi/Directions)
   {
      for(float i = 1.0 / Quality; i <= 1.001; i += 1.0 / Quality)
      {
         Color += texture2D(sampler, fragTexCoord + vec2(cos(d),sin(d))*Radius*i);		
      }
   }

   Color /= Quality * Directions + 1.0;

   gl_FragColor = vec4(Color.xyz, 1.0);
}