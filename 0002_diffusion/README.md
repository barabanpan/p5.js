# Diffusion in 2D

dp/dt = D*d(p/dx)/dx<br/>
Count laplacian ^^

<br/>
p(x, t) - gas equation<br/>
p_new = p + dt*D*d(p/dx)/dx

<br/>
for discrete 1D case, d(p/dx)/dx = (p_(i+1) + p_(i-1) - 2(p_i))/(dx^2)<br/>
for edges (walls, -1), consider p_(i-1) = p_i

<br/>
for discrete 2D, just (sum 4 neighbors - 4 * self) / (dx * dy)
